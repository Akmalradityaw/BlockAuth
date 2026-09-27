<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('known_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('ip_address', 45);
            $table->string('user_agent_hash', 64);
            $table->string('device_name')->nullable();
            $table->timestamp('first_login_at')->useCurrent();
            $table->timestamp('last_login_at')->useCurrent();

            $table->index(['user_id', 'ip_address', 'user_agent_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('known_devices');
    }
};
