@once
    @push('roro-styles')
        <style{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getCssPath() . 'roroform-raw.css')) !!}
        </style>
    @endpush
@endonce
