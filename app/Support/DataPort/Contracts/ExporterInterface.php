<?php

namespace App\Support\DataPort\Contracts;

use Symfony\Component\HttpFoundation\StreamedResponse;

interface ExporterInterface
{
    /**
     * Ekspor data ke stream HTTP response.
     *
     * @param  string  $filename  Nama file tanpa ekstensi
     * @param  array  $headers  Daftar nama kolom header
     * @param  iterable  $rows  Generator atau koleksi baris data
     */
    public function stream(string $filename, array $headers, iterable $rows): StreamedResponse;
}

