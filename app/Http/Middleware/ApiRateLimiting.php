<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiRateLimiting
{
    protected RateLimiter $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $type = 'api'): Response
    {
        $key = $this->resolveRequestSignature($request, $type);
        $maxAttempts = $this->getMaxAttempts($type);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'message' => 'Too many requests',
                'retry_after' => $this->limiter->availableIn($key)
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $this->limiter->hit($key);

        $response = $next($request);

        return $this->addRateLimitHeaders(
            $response,
            $maxAttempts,
            $this->limiter->remaining($key, $maxAttempts)
        );
    }

    /**
     * Resolve request signature for rate limiting.
     */
    protected function resolveRequestSignature(Request $request, string $type): string
    {
        $user = Auth::user();
        
        return sha1(implode('|', [
            $type,
            $user ? $user->id : $request->ip(),
            $request->route()?->getName() ?? $request->path()
        ]));
    }

    /**
     * Get maximum attempts based on rate limit type.
     */
    protected function getMaxAttempts(string $type): int
    {
        $limits = [
            'api' => Auth::check() ? 60 : 30,
            'auth' => 5,
            'uploads' => 10,
            'ocr' => Auth::check() ? 20 : 5
        ];

        return $limits[$type] ?? 60;
    }

    /**
     * Add rate limit headers to response.
     */
    protected function addRateLimitHeaders(
        Response $response,
        int $maxAttempts,
        int $remainingAttempts
    ): Response {
        foreach ([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remainingAttempts,
        ] as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
