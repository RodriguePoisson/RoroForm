<div id="roro-wrapper-{{$id}}" style="@if($hidden) display:none; @endif"
     class="roro-wrapper roro-wrapper-week w-full {{$wrapperClass}} @if($hasTopMargins) mt-6 @endif">

    @if($label)
        <label id="label-{{$id}}" for="{{ $id }}"
               class="roro-label roro-label-week block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 {{$labelClass}}">
            {{ $label }}
            @if($required)
                <x-roro-required-label></x-roro-required-label>
            @endif
        </label>
    @endif

    <x-roro-border-error :hidden="!$error || !$enableError">
        <div class="relative">
            <input
                type="week"
                name="{{ $name }}"
                id="{{ $id }}"
                value="{{ $value }}"
                @if($list)
                    list="{{$list}}"
                @endif
                @if($enableError) aria-describedby="roro-error-{{ $id }}" @endif
                aria-invalid="{{ $error ? 'true' : 'false' }}"
                @if($required) aria-required="true" @endif
                @if($disabled)
                    disabled
                @endif
                @if($readonly)
                    readonly
                @endif
                {{ ($required && !$disableJsValidation)? 'required' : '' }}
                @if(!is_null($min)) min="{{ $min }}" @endif
                @if(!is_null($max)) max="{{ $max }}" @endif
                @if(!is_null($step)) step="{{ $step }}" @endif
                {{ $attributes->class([
                    'roro-input roro-input-week block w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:disabled:bg-zinc-800',
                    $class,
                ]) }}
            >
        </div>
    </x-roro-border-error>

    <x-roro-error :id="'roro-error-'.$id" :hidden="!$enableError" :error="$error"></x-roro-error>
</div>
