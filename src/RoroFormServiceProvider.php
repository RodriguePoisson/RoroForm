<?php

namespace RoroForm;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use RoroForm\View\Components\FileHelper;
use RoroForm\View\Components\Form;
use RoroForm\View\Components\Helper;
use RoroForm\View\Components\Inputs\BorderError;
use RoroForm\View\Components\Inputs\Checkbox;
use RoroForm\View\Components\Inputs\Color;
use RoroForm\View\Components\Inputs\Date;
use RoroForm\View\Components\Inputs\DatetimeLocal;
use RoroForm\View\Components\Inputs\Email;
use RoroForm\View\Components\Inputs\Error;
use RoroForm\View\Components\Inputs\File;
use RoroForm\View\Components\Inputs\Hidden;
use RoroForm\View\Components\Inputs\Month;
use RoroForm\View\Components\Inputs\MultiSelect;
use RoroForm\View\Components\Inputs\Number;
use RoroForm\View\Components\Inputs\Password;
use RoroForm\View\Components\Inputs\Radio;
use RoroForm\View\Components\Inputs\RadioContainer;
use RoroForm\View\Components\Inputs\Range;
use RoroForm\View\Components\Inputs\Select;
use RoroForm\View\Components\Inputs\Tel;
use RoroForm\View\Components\Inputs\Time;
use RoroForm\View\Components\Inputs\Url;
use RoroForm\View\Components\Inputs\Week;
use RoroForm\View\Components\MultiSelectTextTag;
use RoroForm\View\Components\RequiredLabel;
use RoroForm\View\Components\Inputs\Text;
use RoroForm\View\Components\Overlay;
use RoroForm\View\Components\SelectCategory;
use RoroForm\View\Components\SelectHelper;
use RoroForm\View\Components\SelectOption;
use RoroForm\View\Components\Spinner;
use RoroForm\View\Components\Inputs\Button;

class RoroFormServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Chargement routes
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

        // Chargement config
        $this->publishes([
            __DIR__.'/../config/roroform.php' => config_path('roroform.php'),
        ], 'config');

        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'roroform');

        Blade::component('roro-form', Form::class);
        Blade::component('roro-helper', Helper::class);
        Blade::component('roro-select-helper', SelectHelper::class);
        Blade::component('roro-file-helper', FileHelper::class);
        Blade::component('roro-button', Button::class);
        Blade::component('roro-overlay', Overlay::class);
        Blade::component('roro-spinner', Spinner::class);
        Blade::component('roro-text', Text::class);
        Blade::component('roro-email', Email::class);
        Blade::component('roro-password', Password::class);
        Blade::component('roro-url', Url::class);
        Blade::component('roro-tel', Tel::class);
        Blade::component('roro-number', Number::class);
        Blade::component('roro-hidden', Hidden::class);
        Blade::component('roro-checkbox', Checkbox::class);
        Blade::component('roro-date', Date::class);
        Blade::component('roro-datetime-local', DatetimeLocal::class);
        Blade::component('roro-month', Month::class);
        Blade::component('roro-time', Time::class);
        Blade::component('roro-week', Week::class);
        Blade::component('roro-range', Range::class);
        Blade::component('roro-color', Color::class);
        Blade::component('roro-file', File::class);
        Blade::component('roro-select', Select::class);
        Blade::component('roro-multi-select', MultiSelect::class);
        Blade::component('roro-multi-select-text-tag', MultiSelectTextTag::class);
        Blade::component('roro-select-option', SelectOption::class);
        Blade::component('roro-select-category', SelectCategory::class);
        Blade::component('roro-error', Error::class);
        Blade::component('roro-border-error', BorderError::class);
        Blade::component('roro-radio-container', RadioContainer::class);
        Blade::component('roro-radio', Radio::class);
        Blade::component('roro-required-label', RequiredLabel::class);
    }

    public function register()
    {
        // Enregistrement bindings, singletons...
    }
}
