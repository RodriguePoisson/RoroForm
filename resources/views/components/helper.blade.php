@once
    @push('roro-global-scripts')
        <script{!! $cspNonce ? ' nonce="'.e($cspNonce).'"' : '' !!}>
            {!! file_get_contents(realpath($getJsPath() . 'dom.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'RoroElement.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'Input.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'global.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'form.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'inputs.min.js')) !!}
            {!! file_get_contents(realpath($getJsPath() . 'facade.min.js')) !!}
        </script>
    @endpush
@endonce

