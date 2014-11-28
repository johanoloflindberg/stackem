var prefillForm = function (input) {
    var name = getSubstring(input, 'N:', ';');
    document.getElementById('name').value = name;
    var company = getSubstring(input, 'ORG:', ';');
    document.getElementById('company').value = company;
    var email = getSubstring(input, 'EMAIL:', ';');
    document.getElementById('email').value = email;
}
var getSubstring = function (input, prefix, endChar) {
    var prefixIndex = input.indexOf(prefix);
    var start = prefixIndex + prefix.length;
    var end = input.indexOf(endChar, start);
    if (start == -1 || end == -1) {
        console.log("Error: could not parse result");
    } else {
       return input.substring(start, end); 
    }
}

document.getElementById("sub").value = window.location.search.replace("?sub=", "");
