<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        // Configure rate limiting
        $this->configureRateLimiting();

        $this->routes(function () {
            // API Routes
            Route::middleware('api')
                ->prefix('api')
                ->group(function () {
                    // V1 API Routes
                    Route::prefix('v1')
                        ->group(base_path('routes/api_v1.php'));
                });

            // Web Routes (if needed)
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Rate limit for authentication endpoints
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Rate limit for API endpoints
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            
            return $user
                ? Limit::perMinute(60)->by($user->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Rate limit for file uploads
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Rate limit for OCR processing
        RateLimiter::for('ocr', function (Request $request) {
            $user = $request->user();
            
            return $user
                ? Limit::perMinute(20)->by($user->id)
                : Limit::perMinute(5)->by($request->ip());
        });
    }
}
