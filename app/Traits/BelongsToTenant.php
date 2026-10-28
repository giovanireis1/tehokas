<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * "Boot" da trait para aplicar o Global Scope e o preenchimento automático.
     */
    protected static function bootBelongsToTenant(): void
    {
        // 1. Escopo Global de Leitura: Qualquer SELECT ou find() filtra pelo tenant ativo da sessão
        /** @var Model $class */
        $class = static::class;

        $class::addGlobalScope('tenant_id', function (Builder $builder) {
            if (Auth::check()) {
                $tenantId = session('active_tenant_id') ?? Auth::user()?->tenant_id;

                if ($tenantId) {
                    $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
                }
            }
        });

        // 2. Preenchimento Automático ao Inserir (INSERT)
        $class::creating(function (Model $model) {
            if (Auth::check()) {
                $tenantId = session('active_tenant_id') ?? Auth::user()?->tenant_id;

                if ($tenantId && empty($model->getAttribute('tenant_id'))) {
                    $model->setAttribute('tenant_id', $tenantId);
                }
            }
        });
    }
}