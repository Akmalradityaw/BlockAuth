<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_rules', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45); // IPv4 or IPv6
            $table->string('type', 20)->default('blacklist'); // blacklist, whitelist
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['ip_address', 'type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_rules');
    }
};
