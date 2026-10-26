<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Tehokas Workflow Engine API",
    description: "API de integração externa e Webhooks para acionamento automatizado de workflows.",
    contact: new OA\Contact(name: "Suporte Técnico", email: "contato@tehokas.com")
)]
#[OA\Server(
    url: "http://127.0.0.1:8000",
    description: "Servidor de Desenvolvimento Local"
)]
abstract class Controller
{
    //
}