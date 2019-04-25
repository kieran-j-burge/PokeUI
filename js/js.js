
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
        $.ajax({ cache: false,
            url: "https://pokeapi.co/api/v2/pokemon/"+string+"/",
            success: function (json) {
            renderPokemonOnUI(json);
            },
            error:function (xhr, ajaxOptions, thrownError){
                if(xhr.status==404) {
                    console.log("No pokemon found with name: " + string)
                }
            }
        });
    }

    function renderPokemonOnUI(json){
        console.log(json);
        var img = json.sprites.front_default;
        var stats = json.stats;
        var moves = json.moves;
        var weight = json.weight;

        $("#pokemon-img").attr("src",img)
    }



    $("#pokemon-search").on('input',function(e) {
        var string = this.value;
        console.log(string);
        getPokemon(string);
    });

});
