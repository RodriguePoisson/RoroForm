<?php

use Illuminate\Support\Facades\Route;
use RoroForm\Controllers\AjaxElementController;

Route::get('/roro/ajax/get/select-option',[AjaxElementController::class,'getSelectOption']);
Route::get('/roro/ajax/get/multi-select-text-tag',[AjaxElementController::class,'getMultiSelectTextTag']);

Route::get('/roro/ajax/get/select-category',[AjaxElementController::class,'getSelectCategory']);
