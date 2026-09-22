<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ActivityLogController extends Controller
{
    public function index(Request $request): View
    {
        $limit = (int) $request->query('limit', 20);

        $logs = ActivityLog::with('user:id,name,role')
            ->orderByDesc('created_at')
            ->paginate($limit ?: 20);

        return view('activity-logs.index', ['logs' => $logs]);
    }
}
