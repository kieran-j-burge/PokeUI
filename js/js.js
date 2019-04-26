
$( document ).ready(function() {

    var pokemonOne;
    var pokemonTwo;

    centerV();
    renderFavourites();

    //Center elements vertically
    function centerV() {
        var elements = document.querySelectorAll(".center-v");
        Array.prototype.forEach.call(elements, function(element, index) {
            element.style.marginTop =
                "" +
                (element.closest("#pokemon-show-container").offsetHeight / 2 - element.offsetHeight / 2) +
                "px";
        });
    }

    //Re-renders the favourites by clearing all current pokemon and getting the updated list from local storage
    function renderFavourites() {
        var favList = JSON.parse(localStorage.getItem("fav-list"));
        if (favList != null){
            $("#favourite-dropdown-list").empty();
            favList.forEach(function (pokemon) {
                $("#favourite-dropdown-list").append('<li class="dropdown-item poke-dropdown" ><span class="key">'+pokemon.id+'</span>: <span class="name">'+pokemon.name+'</span> <button class="btn btn-success add-fav-left" id="btn-add-left_'+pokemon.id+'"> Add to left</button><button class="btn btn-warning add-fav-right" id="btn-add-right_'+pokemon.id+'"> Add to right</button></li>')
            });
        }
    }

    function getPokemon(string,id) {
        $.ajax({ cache: false,
            url: "https://pokeapi.co/api/v2/pokemon/"+string+"/",
            success: function (json) {
            renderPokemonOnUI(json,id);
            if(id == 1){
                pokemonOne = json;
            }
            else if(id == 2){
                pokemonTwo = json;
            }
            },
            error:function (xhr, ajaxOptions, thrownError){
                if(xhr.status==404) {
                    console.log("No pokemon found with name: " + string)
                }
            }
        });
    }

    function renderPokemonOnUI(json,id){
        console.log(json);
        var img = json.sprites.front_default;
        var stats = json.stats;
        var moves = json.moves;
        var weight = json.weight;

        $("#pokemon"+id+"-img").attr("src",img)
    }


    $("#pokemon1-search").on('input',function(e) {
        var string = this.value;
        console.log(string);
        getPokemon(string,1);
    });

    $("#pokemon2-search").on('input',function(e) {
        var string = this.value;
        console.log(string);
        getPokemon(string,2);
    });

    //Handles both favourite buttons and adds the current pokemon data to local storage
    $(".btn-fav").on('click',function(e) {
        var listJSON = JSON.parse(localStorage.getItem("fav-list"));

        var pokemon;
        if (~$(this).attr('id').indexOf("btn-fav-1")){
            pokemon = pokemonOne;
        }
        else if(~$(this).attr('id').indexOf("btn-fav-2")){
            pokemon = pokemonTwo;
        }

        if (listJSON != null){
            var check = checkIfDuplicate(listJSON,pokemon);
            console.log(check);

            if(!checkIfDuplicate(listJSON,pokemon)){
                listJSON.push(pokemon);
            }
            else{
                alert("You already have this pokemon as a favourite")
            }
        }else {
            listJSON = [{id:pokemon.id, name:pokemon.name}];
        }
        localStorage.setItem("fav-list", JSON.stringify(listJSON));
    });

    // Re render the list for the favourites to account for newly added pokemon
    $("#favourite-dropdown-btn").on('click',function(e) {
        renderFavourites();
    });

    // On click for dynamically added buttons to add pokemon to the 1st container
    $(document.body).on('click', '.add-fav-left' ,function(){
        getPokemon($(this).closest(".poke-dropdown").find(".key").text(),1);
    });

    // On click for dynamically added buttons to add pokemon to the 2nd container
    $(document.body).on('click', '.add-fav-right' ,function(){
        getPokemon($(this).closest(".poke-dropdown").find(".key").text(),2);
    });


    // Checks for duplicates in the favourite list
    function checkIfDuplicate(favList,checkPokemon){
    var check = false;
    favList.forEach(function (pokemon) {
        if(pokemon.id == checkPokemon.id){
            check = true;
        }
    });
    return check;
    }



});
