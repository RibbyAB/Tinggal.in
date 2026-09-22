@include('errors.app', [
    'status' => 403,
    'message' => $exception->getMessage() ?: 'Kamu tidak punya akses ke halaman ini.',
])
