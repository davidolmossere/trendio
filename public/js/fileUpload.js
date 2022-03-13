FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImageValidateSize,
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType
);

FilePond.setOptions({
    maxFileSize: '1MB',
    imageValidateSizeMinWidth: 200,
    acceptedFileTypes: ['image/png', 'image/jpeg', 'image/gif']
})
FilePond.parse(document.body);