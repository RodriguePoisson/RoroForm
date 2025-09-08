<?php

namespace RoroForm\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use RoroForm\View\Components\MultiSelectTextTag;
use RoroForm\View\Components\SelectCategory;
use RoroForm\View\Components\SelectOption;

class AjaxElementController extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    public function getSelectOption($type = 'select-option')
    {
        return $this->renderComponent(SelectOption::class, [
            'label' => request()->input('label', ''),
            'value' => request()->input('value', ''),
            'class' => request()->input('class', ''),
            'hidden' => request()->boolean('hidden', false),
            'id' => request()->input('id', null),
            'type' => $type
        ]);
    }

    public function getMultiSelectTextTag()
    {
        return $this->renderComponent(MultiSelectTextTag::class, [
            'id' => request()->input('id', null),
        ]);
    }

    public function getSelectCategory()
    {
        return $this->renderComponent(SelectCategory::class, [
            'category' => request()->input('category', ''),
            'class' => request()->input('class', ''),
            'hidden' => request()->boolean('hidden', false),
            'id' => request()->input('id', null),
        ]);
    }

    private function renderComponent(string $componentClass, array $data)
    {
        $component = $componentClass::resolve($data);
        $view = $component->resolveView();
        return response($view->with($component->data())->render());
    }
}
