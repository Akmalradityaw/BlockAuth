<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Organisasi & Anggota Tim
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('max_members')->default(50);
            $table->timestamps();
        });

        Schema::create('organization_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('member'); // owner, admin, member, guest
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
        });

        // 2. Klien OAuth & Developer Apps
        Schema::create('oauth_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('client_id', 40)->unique();
            $table->string('client_secret', 80);
            $table->text('redirect_uri');
            $table->json('scopes')->nullable(); // ['profile', 'email', 'users:read']
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Tiket Permohonan & Insiden Keamanan
        Schema::create('security_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category'); // 2fa_reset, ip_appeal, suspicious_activity, general
            $table->string('priority')->default('medium'); // low, medium, high, critical
            $table->string('status')->default('open'); // open, in_progress, resolved, closed
            $table->string('subject');
            $table->text('description');
            $table->timestamps();
        });

        Schema::create('ticket_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('security_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_internal')->default(false);
            $table->timestamps();
        });

        // 4. Kebijakan Akses Kontekstual & Geofencing
        Schema::create('access_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // geofencing, time_restriction, connection_security
            $table->string('action')->default('block'); // block, allow
            $table->json('rules'); // config rules payload
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 5. Template Notifikasi Email Sistem
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); // email_verification, password_reset, new_device_login, lockout_alert
            $table->string('name');
            $table->string('subject');
            $table->longText('body');
            $table->json('variables')->nullable(); // ['user_name', 'action_url', 'ip_address', 'login_time']
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('access_policies');
        Schema::dropIfExists('ticket_replies');
        Schema::dropIfExists('security_tickets');
        Schema::dropIfExists('oauth_clients');
        Schema::dropIfExists('organization_members');
        Schema::dropIfExists('organizations');
    }
};
