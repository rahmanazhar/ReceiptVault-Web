<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as Middleware;

class PreventRequestsDuringMaintenance extends Middleware
{
    /**
     * The URIs that should be reachable while maintenance mode is enabled.
     *
     * @var array<int, string>
     */
    protected $except = [
        // API health check endpoint
        'api/v1/health',
        // Authentication endpoints
        'api/v1/auth/login',
        'api/v1/auth/refresh',
    ];
}
