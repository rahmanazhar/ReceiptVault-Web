<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Repositories\Interfaces\RepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseRepository implements RepositoryInterface
{
    protected Model $model;
    protected Builder $query;

    public function __construct()
    {
        $this->model = $this->createModel();
        $this->query = $this->model->newQuery();
    }

    abstract protected function createModel(): Model;

    public function all(): Collection
    {
        return $this->query->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return $this->query->paginate($perPage);
    }

    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    public function update(array $data, int $id): Model
    {
        $model = $this->findOrFail($id);
        $model->update($data);
        return $model->fresh();
    }

    public function delete(int $id): bool
    {
        return $this->findOrFail($id)->delete();
    }

    public function find(int $id): ?Model
    {
        return $this->query->find($id);
    }

    public function findOrFail(int $id): Model
    {
        return $this->query->findOrFail($id);
    }

    public function findBy(array $criteria, array $columns = ['*']): Collection
    {
        return $this->buildQueryByCriteria($criteria)->get($columns);
    }

    public function findOneBy(array $criteria, array $columns = ['*']): ?Model
    {
        return $this->buildQueryByCriteria($criteria)->first($columns);
    }

    public function with(array $relations): self
    {
        $this->query = $this->query->with($relations);
        return $this;
    }

    protected function buildQueryByCriteria(array $criteria): Builder
    {
        $query = $this->query;
        
        foreach ($criteria as $key => $value) {
            if (is_array($value)) {
                [$operator, $val] = $value;
                $query->where($key, $operator, $val);
            } else {
                $query->where($key, '=', $value);
            }
        }

        return $query;
    }

    protected function resetQuery(): void
    {
        $this->query = $this->model->newQuery();
    }
}
