<?php

    namespace App\Enums;

    enum WorkflowTrigger: string
    {
        case PROJECT_CREATED = 'projeto_criado';
        case STATUS_CHANGED  = 'status_projeto_alterado';

        public static function options(): array
        {
            return [
                [
                    'id' => self::PROJECT_CREATED->value, 
                    'label' => 'Quando um novo projeto for criado'
                ],
                [
                    'id' => self::STATUS_CHANGED->value, 
                    'label' => 'Quando o status de um projeto for alterado'
                ],
            ];
        }
    }