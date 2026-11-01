<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pemeliharaan - BlockAuth</title>
    <style>
        body { margin: 0; background: #F8FAFC; color: #1E1B4B; font-family: system-ui, sans-serif; }
        .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .card { width: 100%; max-width: 28rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 32px; text-align: center; }
        .badge { display: inline-flex; width: 56px; height: 56px; align-items: center; justify-content: center; border-radius: 16px; background: #F59E0B; font-size: 24px; font-weight: 800; }
        .btn { display: inline-block; margin-top: 24px; background: #6D28D9; color: #fff; padding: 8px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; }
        .muted { color: #334155; font-size: 14px; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <span class="badge">!</span>
            <h1>Sistem dalam pemeliharaan</h1>
            <p class="muted">{{ $exception->getMessage() ?: 'Kami segera kembali.' }}</p>
            <a class="btn" href="/">Muat ulang</a>
        </div>
    </div>
</body>
</html>
