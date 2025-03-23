<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Authorize a resource action based on a given model.
     *
     * @param string $model
     * @param string|null $parameter
     * @param array $options
     * @param bool|callable $callback
     * @return void
     */
    protected function authorizeResource(string $model, string $parameter = null, array $options = [], $callback = true): void
    {
        $parameter = $parameter ?? strtolower(class_basename($model));

        $middleware = [];
        $abilities = [
            'index' => 'viewAny',
            'show' => 'view',
            'create' => 'create',
            'store' => 'create',
            'edit' => 'update',
            'update' => 'update',
            'destroy' => 'delete',
        ];

        foreach ($abilities as $method => $ability) {
            $middleware["can:{$ability},{$parameter}"][] = $method;
        }

        foreach ($middleware as $middlewareName => $methods) {
            $this->middleware($middlewareName)->only($methods);
        }
    }
}
