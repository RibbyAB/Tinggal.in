<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Tinggal.in')</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: "#f1f8f2",
                            100: "#dceee0",
                            200: "#bcdcc3",
                            300: "#93c5a0",
                            400: "#6bb07e",
                            500: "#4c9a5f",
                            600: "#357a45",
                            700: "#296137",
                            800: "#1f4f2c",
                            900: "#163f22",
                        },
                        clay: {
                            50: "#fbf3f0",
                            100: "#f6e2dc",
                            500: "#b4553f",
                            700: "#9c4634",
                        },
                    },
                },
            },
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>

    <style>
        dialog::backdrop {
            background: rgb(0 0 0 / 0.4);
        }

        .organic-bg {
            background-color: #1f4f2c;
            background-image:
                radial-gradient(circle at 10% 15%, #3f8a52 0%, #3f8a52 12%, transparent 30%),
                radial-gradient(circle at 30% 8%, #245c34 0%, #245c34 10%, transparent 26%),
                radial-gradient(circle at 78% 12%, #4c9a5f 0%, #4c9a5f 14%, transparent 32%),
                radial-gradient(circle at 92% 30%, #163f22 0%, #163f22 9%, transparent 24%),
                radial-gradient(circle at 88% 68%, #3f8a52 0%, #3f8a52 16%, transparent 36%),
                radial-gradient(circle at 65% 85%, #245c34 0%, #245c34 13%, transparent 30%),
                radial-gradient(circle at 25% 90%, #4c9a5f 0%, #4c9a5f 15%, transparent 34%),
                radial-gradient(circle at 8% 65%, #163f22 0%, #163f22 10%, transparent 26%),
                radial-gradient(circle at 45% 45%, #245c34 0%, #245c34 20%, transparent 45%),
                radial-gradient(circle at 55% 25%, rgba(241, 248, 242, 0.08) 0%, transparent 20%);
            background-blend-mode: overlay, overlay, overlay, overlay, overlay, overlay, overlay, overlay, normal, normal;
        }

        .dashboard-bg {
            background-color: #f4f7f3;
            background-image:
                radial-gradient(900px circle at 5% -10%, rgba(76, 154, 95, 0.16) 0%, transparent 60%),
                radial-gradient(700px circle at 100% 0%, rgba(31, 79, 44, 0.10) 0%, transparent 55%),
                radial-gradient(800px circle at 50% 115%, rgba(163, 199, 113, 0.14) 0%, transparent 60%);
            background-attachment: fixed;
        }
    </style>
    @stack('head')
</head>
<body class="dashboard-bg min-h-screen text-gray-900">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-700 focus:shadow">
        Lewati ke konten utama
    </a>

    <div class="lg:flex">
        @include('partials.sidebar')

        <div class="flex min-h-screen flex-1 flex-col">
            @include('partials.navbar')

            <main id="main" class="flex-1 px-4 py-6 lg:px-8">
                @if (session('success'))
                    <div id="flash-success" role="status" class="mb-5 flex items-start justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                        <span>{{ session('success') }}</span>
                        <button type="button" onclick="document.getElementById('flash-success').remove()" class="text-primary-700/70 hover:text-primary-900" aria-label="Tutup pesan">&times;</button>
                    </div>
                @endif

                @if (session('error'))
                    <div id="flash-error" role="alert" class="mb-5 flex items-start justify-between gap-3 rounded-xl border border-clay-100 bg-clay-50 px-4 py-3 text-sm text-clay-700">
                        <span>{{ session('error') }}</span>
                        <button type="button" onclick="document.getElementById('flash-error').remove()" class="text-clay-700/70 hover:text-clay-700" aria-label="Tutup pesan">&times;</button>
                    </div>
                @endif

                @yield('content')
            </main>

            <footer class="px-4 pb-6 text-xs text-gray-400 lg:px-8">
                <p>&copy; {{ date('Y') }} Tinggal.in &middot; Sistem manajemen kost</p>
            </footer>
        </div>
    </div>

    <script>
        setTimeout(function () {
            ['flash-success', 'flash-error'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) {
                    el.style.transition = 'opacity 0.4s ease';
                    el.style.opacity = '0';
                    setTimeout(function () { el.remove(); }, 400);
                }
            });
        }, 4000);
    </script>
    @stack('scripts')
</body>
</html>
