<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\SecurityTicket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SecurityTicketController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('settings:read');

        $query = SecurityTicket::with(['user:id,name,email', 'assignee:id,name,email', 'replies.user:id,name,email']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $tickets = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $stats = [
            'total' => SecurityTicket::count(),
            'open' => SecurityTicket::where('status', 'open')->count(),
            'in_progress' => SecurityTicket::where('status', 'in_progress')->count(),
            'resolved' => SecurityTicket::where('status', 'resolved')->count(),
            'critical' => SecurityTicket::where('priority', 'critical')->whereIn('status', ['open', 'in_progress'])->count(),
        ];

        $securityStaff = User::role('SuperAdmin')->select(['id', 'name', 'email'])->get();

        return Inertia::render('Security/Tickets', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'priority', 'category', 'per_page']),
            'stats' => $stats,
            'securityStaff' => $securityStaff,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', Rule::in(['2fa_reset', 'ip_appeal', 'suspicious_activity', 'general'])],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high', 'critical'])],
            'description' => ['required', 'string', 'max:2000'],
        ]);

        $ticket = SecurityTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'description' => $data['description'],
            'status' => 'open',
        ]);

        AuditLog::record('ticket:created', "Membuat tiket keamanan baru: {$ticket->ticket_number}", [
            'ticket_number' => $ticket->ticket_number,
            'category' => $ticket->category,
        ], $request->user());

        return back()->with('success', "Tiket laporan #{$ticket->ticket_number} berhasil dibuat.");
    }

    public function reply(Request $request, SecurityTicket $securityTicket)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        TicketReply::create([
            'ticket_id' => $securityTicket->id,
            'user_id' => $request->user()->id,
            'message' => $data['message'],
            'is_internal' => $data['is_internal'] ?? false,
        ]);

        if ($securityTicket->status === 'open' && $request->user()->hasRole('SuperAdmin')) {
            $securityTicket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Tanggapan berhasil dikirim.');
    }

    public function updateStatus(Request $request, SecurityTicket $securityTicket)
    {
        Gate::authorize('settings:manage');

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $securityTicket->update($data);

        AuditLog::record('ticket:status_updated', "Memperbarui status tiket #{$securityTicket->ticket_number} menjadi {$data['status']}", [
            'ticket_id' => $securityTicket->id,
            'status' => $data['status'],
        ], $request->user());

        return back()->with('success', "Status tiket #{$securityTicket->ticket_number} berhasil diperbarui.");
    }

    public function destroy(Request $request, SecurityTicket $securityTicket)
    {
        Gate::authorize('settings:manage');

        $num = $securityTicket->ticket_number;
        $securityTicket->delete();

        AuditLog::record('ticket:deleted', "Menghapus tiket #{$num}", [], $request->user());

        return back()->with('success', "Tiket #{$num} telah dihapus.");
    }
}
