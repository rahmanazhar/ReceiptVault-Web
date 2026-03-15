<?php

namespace App\Console\Commands;

use App\Domain\Models\Receipt;
use App\Domain\Models\Transaction;
use App\Jobs\ProcessReceiptWithAi;
use Illuminate\Console\Command;

class ReprocessReceipts extends Command
{
    protected $signature = 'receipts:reprocess
                            {--user= : Only reprocess receipts for a specific user ID}
                            {--status= : Only reprocess receipts with a specific status (e.g. completed, failed, review_needed)}
                            {--sync : Process synchronously instead of dispatching to queue}
                            {--keep-transactions : Do not delete existing transactions before reprocessing}';

    protected $description = 'Reprocess all receipts through AI extraction to regenerate transactions with updated LHDN categories';

    public function handle(): int
    {
        $query = Receipt::query();

        if ($userId = $this->option('user')) {
            $query->where('user_id', $userId);
        }

        if ($status = $this->option('status')) {
            $query->where('status', $status);
        }

        $receipts = $query->get();

        if ($receipts->isEmpty()) {
            $this->warn('No receipts found matching the criteria.');
            return 0;
        }

        $this->info("Found {$receipts->count()} receipts to reprocess.");

        if (!$this->option('keep-transactions')) {
            $this->warn('This will DELETE existing transactions for these receipts and regenerate them.');
        }

        if (!$this->confirm('Do you want to continue?')) {
            $this->info('Cancelled.');
            return 0;
        }

        $bar = $this->output->createProgressBar($receipts->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($receipts as $receipt) {
            try {
                // Delete existing transactions for this receipt to avoid duplicates
                if (!$this->option('keep-transactions')) {
                    Transaction::where('receipt_id', $receipt->id)->delete();
                }

                if ($this->option('sync')) {
                    ProcessReceiptWithAi::dispatchSync($receipt->id);
                } else {
                    ProcessReceiptWithAi::dispatch($receipt->id);
                }

                $success++;
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Failed receipt #{$receipt->id}: {$e->getMessage()}");
                $failed++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Done! {$success} dispatched, {$failed} failed.");

        if (!$this->option('sync')) {
            $this->info('Receipts are being processed in the background. Run `php artisan queue:work` to process the queue.');
        }

        return 0;
    }
}
