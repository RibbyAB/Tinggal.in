<?php

namespace App\Services;

use App\Exceptions\AppException;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ComplaintService
{
    public function __construct(private readonly ActivityLogService $activityLog) {}

    public function listComplaints(array $filters): LengthAwarePaginator
    {
        $query = Complaint::with(['tenant.user', 'updates.updatedBy:id,name,role']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (! empty($filters['tenant_id'])) {
            $query->where('tenant_id', (int) $filters['tenant_id']);
        }

        return $query->orderByDesc('created_at')
            ->paginate((int) ($filters['limit'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();
    }

    public function getComplaintById(int $id, ?int $tenantId = null): Complaint
    {
        $complaint = Complaint::with([
            'tenant.user',
            'updates' => fn ($q) => $q->orderBy('created_at')->with('updatedBy:id,name,role'),
        ])->find($id);

        if (! $complaint) {
            throw new AppException('Complaint not found.', 404);
        }

        if ($tenantId !== null && $complaint->tenant_id !== $tenantId) {
            throw new AppException('You do not have permission to view this complaint.', 403);
        }

        return $complaint;
    }

    public function createComplaint(array $data, ?string $imagePath, int $tenantId, int $actingUserId): Complaint
    {
        return DB::transaction(function () use ($data, $imagePath, $tenantId, $actingUserId) {
            $complaint = Complaint::create([
                'tenant_id' => $tenantId,
                'title' => $data['title'],
                'description' => $data['description'],
                'category' => $data['category'] ?? 'OTHER',
                'priority' => $data['priority'] ?? 'MEDIUM',
                'image_path' => $imagePath,
                'status' => 'OPEN',
            ]);

            $this->activityLog->log(
                $actingUserId,
                'COMPLAINT_SUBMITTED',
                'Complaint',
                $complaint->id,
                "Complaint \"{$complaint->title}\" submitted."
            );

            return $complaint;
        });
    }

    public function updateComplaintStatus(int $id, string $status, ?string $note, User $actingUser): Complaint
    {
        return DB::transaction(function () use ($id, $status, $note, $actingUser) {
            $complaint = Complaint::find($id);
            if (! $complaint) {
                throw new AppException('Complaint not found.', 404);
            }

            $complaint->update(['status' => $status]);

            $complaint->updates()->create([
                'updated_by_id' => $actingUser->id,
                'status' => $status,
                'note' => $note ?: null,
                'created_at' => now(),
            ]);

            $this->activityLog->log(
                $actingUser->id,
                'COMPLAINT_STATUS_CHANGED',
                'Complaint',
                $complaint->id,
                "Status changed to {$status}."
            );

            return $complaint->fresh();
        });
    }
}
