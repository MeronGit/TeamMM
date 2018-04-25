$(function() {
    const studentNames = new Bloodhound({
        local: ["Magnus Teekivi", "Merli Lall", "Ragnar Rebase",
                 "Aivar Loopalu", "Britta Pung"],
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        datumTokenizer: Bloodhound.tokenizers.whitespace
    });
    studentNames.initialize();

    $("#students").tagsinput({
        maxTags: 2,
        freeInput: false,
        typeaheadjs: [
            {
                higlight: true,
            },
            {
                source: studentNames.ttAdapter()
            }
        ]
    });
    $("#students").tagsinput("input").on("keydown paste", function(event) {
        if ($("#students").tagsinput("items").length >= 2) {
            event.preventDefault();
        }
    });
});
