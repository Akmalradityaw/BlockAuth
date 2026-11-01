<?php

namespace App\Support\DataPort\Contracts;

interface ImporterInterface
{
    /**
     * Parse file yang diunggah menjadi array baris asosiatif.
     *
     * @param  string  $filePath  Path absolut file yang diunggah
     * @return array  Array of associative arrays [ ['col1' => 'val1', ...], ... ]
     */
    public function parse(string $filePath): array;
}

