
$( document ).ready(function() {

    getPokemon();
    centerV();


    function centerV() {
        var elements = document.querySelectorAll(".center-v");
        Array.prototype.forEach.call(elements, function(element, index) {
            element.style.marginTop =
                "" +
                (element.closest("#pokemon-show-container").offsetHeight / 2 - element.offsetHeight / 2) +
                "px";
        });
    }

    function getPokemon(string) {
        // $.get( "https://pokeapi.co/api/v2/pokemon/"+string+"/", function( data ) {
        //     console.log(data);
        // });

        $.ajax({ cache: false,
            url: "https://pokeapi.co/api/v2/pokemon/"+string+"/",
            success: function (data) {
                console.log(data);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if(xhr.status==404) {
                    console.log("No pokemon found with name: " + string)
                }
            }
        });

    }

    $("#pokemon-search").on('input',function(e) {
        var string = this.value;
        console.log(string);
        getPokemon(string);
    });

});
