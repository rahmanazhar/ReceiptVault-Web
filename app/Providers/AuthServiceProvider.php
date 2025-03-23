<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        \App\Domain\Models\Receipt::class => \App\Policies\ReceiptPolicy::class,
        \App\Domain\Models\Transaction::class => \App\Policies\TransactionPolicy::class,
        \App\Domain\Models\Category::class => \App\Policies\CategoryPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Register default policies
        $this->registerPolicies();

        // Define gates for receipt access
        Gate::define('view-receipt', function ($user, $receipt) {
            return $user->id === $receipt->user_id;
        });

        Gate::define('update-receipt', function ($user, $receipt) {
            return $user->id === $receipt->user_id;
        });

        Gate::define('delete-receipt', function ($user, $receipt) {
            return $user->id === $receipt->user_id;
        });

        // Define gates for transaction access
        Gate::define('view-transaction', function ($user, $transaction) {
            return $user->id === $transaction->user_id;
        });

        Gate::define('update-transaction', function ($user, $transaction) {
            return $user->id === $transaction->user_id;
        });

        Gate::define('delete-transaction', function ($user, $transaction) {
            return $user->id === $transaction->user_id;
        });

        // Define gates for category access
        Gate::define('view-category', function ($user, $category) {
            return $user->id === $category->user_id || $category->is_system;
        });

        Gate::define('update-category', function ($user, $category) {
            return $user->id === $category->user_id && !$category->is_system;
        });

        Gate::define('delete-category', function ($user, $category) {
            return $user->id === $category->user_id && !$category->is_system;
        });
    }
}
