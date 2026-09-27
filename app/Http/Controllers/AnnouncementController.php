<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $query = Announcement::with('creator');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        $announcements = $query->orderBy('pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        $totalReads = AnnouncementRead::count();

        $stats = [
            'total' => Announcement::count(),
            'active' => Announcement::where('is_active', true)->count(),
            'pinned' => Announcement::where('pinned', true)->count(),
            'total_reads' => $totalReads,
        ];

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'type']),
            'stats' => $stats,
        ]);
    }
    public function store(Request $request)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string', 'max:1000'],
            'type' => ['required', 'string', Rule::in(['info', 'warning', 'danger', 'success'])],
            'pinned' => ['nullable', 'boolean'],
        ]);

        $announcement = Announcement::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'content' => $data['content'],
            'type' => $data['type'],
            'pinned' => (bool) ($data['pinned'] ?? false),
            'is_active' => true,
        ]);

        AuditLog::record(
            'announcement:created',
            "Membuat pengumuman broadcast sistem: {$announcement->title}",
            [
                'title' => $announcement->title,
                'type' => $announcement->type,
                'pinned' => $announcement->pinned,
            ]
        );

        return back()->with('success', 'Pengumuman berhasil disiarkan kepada seluruh pengguna.');
    }

    public function destroy(Announcement $announcement)
    {
        Gate::authorize('settings:manage');

        $title = $announcement->title;
        $announcement->delete();

        AuditLog::record(
            'announcement:deleted',
            "Menghapus pengumuman siaran: {$title}",
            ['title' => $title]
        );

        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }

    public function markAsRead(Announcement $announcement, Request $request)
    {
        AnnouncementRead::firstOrCreate([
            'announcement_id' => $announcement->id,
            'user_id' => $request->user()->id,
        ], [
            'read_at' => now(),
        ]);

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $userId = $request->user()->id;
        $activeAnnouncements = Announcement::active()->pluck('id');

        $inserts = [];
        $existing = AnnouncementRead::where('user_id', $userId)
            ->whereIn('announcement_id', $activeAnnouncements)
            ->pluck('announcement_id')
            ->flip();

        foreach ($activeAnnouncements as $id) {
            if (! isset($existing[$id])) {
                $inserts[] = [
                    'announcement_id' => $id,
                    'user_id' => $userId,
                    'read_at' => now(),
                ];
            }
        }

        if (! empty($inserts)) {
            AnnouncementRead::insert($inserts);
        }

        return back()->with('success', 'Semua notifikasi telah ditandai sebagai dibaca.');
    }
}
