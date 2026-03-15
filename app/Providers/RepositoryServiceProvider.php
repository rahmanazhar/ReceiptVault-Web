<?php

namespace App\Providers;

use App\Domain\Repositories\Interfaces\{
    CategoryRepositoryInterface,
    ReceiptRepositoryInterface,
    TransactionRepositoryInterface
};
use App\Infrastructure\Repositories\{
    CategoryRepository,
    ReceiptRepository,
    TransactionRepository
};
use App\Domain\Services\{
    AbacusAiService,
    AuthService,
    CategoryService,
    ReceiptService,
    TransactionService
};
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind repositories
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(ReceiptRepositoryInterface::class, ReceiptRepository::class);
        $this->app->bind(TransactionRepositoryInterface::class, TransactionRepository::class);

        // Register services as singletons
        $this->app->singleton(AbacusAiService::class);
        $this->app->singleton(AuthService::class);
        $this->app->singleton(CategoryService::class);
        $this->app->singleton(ReceiptService::class);
        $this->app->singleton(TransactionService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
