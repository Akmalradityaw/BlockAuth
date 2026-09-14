<?php

namespace App\Console\Commands;

use App\Services\DevProcessRunner;
use Illuminate\Console\Command;

class DevCommand extends Command
{
    protected $signature = 'app:dev {--port=8000 : Port untuk php artisan serve}';

    protected $description = 'Jalankan serve dan vite bersamaan dalam satu terminal';

    public function handle(): int
    {
        // ponytail: dibuat manual (bukan inject) agar OutputInterface terisi output command ini.
        $runner = new DevProcessRunner($this->output);

        $this->info('Menjalankan serve + vite, Ctrl+C untuk berhenti.');

        return $runner->run((int) $this->option('port'));
    }
}
