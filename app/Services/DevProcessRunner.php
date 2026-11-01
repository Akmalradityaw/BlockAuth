<?php

namespace App\Services;

use RuntimeException;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;

class DevProcessRunner
{
    public function __construct(private OutputInterface $output) {}

    public function run(int $port): int
    {
        $this->checkBinary('php');
        $this->checkBinary('npm');

        $serve = new Process(['php', 'artisan', 'serve', '--host=127.0.0.1', '--port=' . $port], base_path());
        $vite = new Process(['npm', 'run', 'dev'], base_path());

        foreach ([$serve, $vite] as $process) {
            $process->setTimeout(null);
            $process->start();
        }

        // ponytail: pcntl missing on Windows, shutdown fn is the fallback;
        // hard kill (taskkill) can still orphan children, use Ctrl+C instead.
        $this->trapShutdown(fn () => $this->stop($serve, $vite));

        while ($serve->isRunning() || $vite->isRunning()) {
            $this->drain($serve, 'SERVE', 'fg=green');
            $this->drain($vite, 'VITE', 'fg=cyan');
            usleep(100000);

            foreach (['SERVE' => $serve, 'VITE' => $vite] as $name => $process) {
                if (! $process->isRunning() && $process->getExitCode() !== 0) {
                    $this->output->writeln("<error>[$name] crash (exit {$process->getExitCode()}), menghentikan sisanya.</error>");
                    $this->stop($serve, $vite);

                    return 1;
                }
            }
        }

        return 0;
    }

    private function drain(Process $process, string $name, string $color): void
    {
        foreach (explode("\n", $process->getIncrementalOutput() . $process->getIncrementalErrorOutput()) as $line) {
            if (trim($line) !== '') {
                $this->output->writeln("<$color>[$name]</> $line");
            }
        }
    }

    private function stop(Process ...$processes): void
    {
        foreach ($processes as $process) {
            if ($process->isRunning()) {
                $process->stop(5);
            }
        }
    }

    private function checkBinary(string $binary): void
    {
        $check = new Process([$binary, '--version']);
        $check->run();

        if (! $check->isSuccessful()) {
            throw new RuntimeException("Binary '$binary' tidak ditemukan di PATH.");
        }
    }

    private function trapShutdown(callable $cleanup): void
    {
        if (extension_loaded('pcntl')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGINT, function () use ($cleanup) {
                $cleanup();
                exit(130);
            });
            pcntl_signal(SIGTERM, function () use ($cleanup) {
                $cleanup();
                exit(143);
            });
        }

        register_shutdown_function($cleanup);
    }
}
