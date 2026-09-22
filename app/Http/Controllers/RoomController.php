<?php

namespace App\Http\Controllers;

use App\Exceptions\AppException;
use App\Http\Requests\RoomRequest;
use App\Models\Room;
use App\Services\RoomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class RoomController extends Controller
{
    public function __construct(private readonly RoomService $roomService) {}

    public function index(Request $request): View
    {
        $rooms = $this->roomService->listRooms($request->query());

        return view('rooms.index', ['rooms' => $rooms]);
    }

    public function show(Room $room): View
    {
        $room = $this->roomService->getRoomById($room->id);

        return view('rooms.show', ['room' => $room]);
    }

    public function store(RoomRequest $request): RedirectResponse
    {
        try {
            $this->roomService->createRoom($request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Room created successfully.');
    }

    public function update(RoomRequest $request, Room $room): RedirectResponse
    {
        try {
            $this->roomService->updateRoom($room->id, $request->validated(), $request->user());
        } catch (AppException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Room updated successfully.');
    }

    public function updateStatus(Request $request, Room $room): RedirectResponse
    {
        $request->validate(['status' => ['required', 'in:AVAILABLE,MAINTENANCE']]);

        try {
            $this->roomService->updateRoomStatus($room->id, $request->input('status'), $request->user());
        } catch (AppException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Room status updated.');
    }
}
