<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $mapped = [];
        foreach (DB::table('settings')->pluck('value', 'key')->all() as $key => $value) {
            $mapped[$key] = $value === '1';
        }

        File::put(storage_path('app/settings.json'), json_encode($mapped, JSON_PRETTY_PRINT));
        Schema::dropIfExists('settings');
    }

    public function down(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('value')->default('1');
        });

        foreach (json_decode(File::get(storage_path('app/settings.json')), true) ?? [] as $key => $value) {
            DB::table('settings')->insert(['key' => $key, 'value' => $value ? '1' : '0']);
        }
    }
};
