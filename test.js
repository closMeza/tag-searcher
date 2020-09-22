//'use strict'; this prevents the use of undeclared variables

// Main toggle var
var mainToggle;
var mainOverlay;

// Global vars associated with Tag Seacher
var list;
var tagsOverlay;
var searchBar;
var searchBtn;
var tagToggle;
var reset;

//Global vars assocated with details and model info
var modelInfo;
var details;

//Global for showcase
var showcaseFrame;
var model_id;

var image_details= {
    w: '',
    h:'',
    x:'',
    y:'',
    res: ''
}

var settings = {
    sweep: '',
    mode: 'INSIDE',
    transition: 'FADEOUT'
  };

// This sets the global vars above and sets up connection
// to matterport once the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    mainToggle = document.getElementById('main-toggle');
    mainToggle.style.visibility = 'hidden';
    mainOverlay = document.getElementById('overlay');
    mainOverlay.style.visibility = 'hidden';
    
    showcaseFrame = document.getElementById('showcase_iframe');

    searchBar = document.getElementById('search-bar');
    searchBtn = document.getElementById('search-btn')
    list = document.getElementById('mt-container');
    reset = document.getElementById('reset');


    tagsOverlay = document.getElementById('tags-container');
    tagToggle = document.getElementById('tags-toggle');
    tagsOverlay.style.visibility = 'hidden';


    modelInfo = document.getElementById('model-info');

    detailsToggle = document.getElementById('details-toggle');
    detailsOverlay = document.getElementById('details-overlay');
    details = document.getElementById('details');
    detailsOverlay.style.visibility= 'hidden';


    var url = new URL(window.location.href);

    var model_id = url.searchParams.get('m');

    var model_id = "z48xxMCCUcZ";


    showcaseFrame.setAttribute('src', `https://my.matterport.com/show/?m=${model_id}&title=0&play=1&qs=1&gt=0&hr=0`)

    showcaseFrame.addEventListener('load', showcaseLoader, true);

})

/**
 * Author: Carlos Meza
 * Date: 08/14/2020
 * Description: This function sets initiates  the connection to the matterport SDK
 */
function showcaseLoader()
{
    try
    {
        window.MP_SDK.connect(showcaseFrame,  '6bdbe628d7b3445ca26b16a311306d0e', '3.4' )
            .then(showcaseHandler)
            .catch((e) => console.log(e));
    }
    catch(e)
    {
        console.log(e);
    }
}

/**
 * Author: Carlos Meza
 * Date: 08/14/2020
 * Input: mpSdk The Primary Object that contains all of Matterports SDk functionality
 * Description: This is where all the interaction for the Matterport Model takes place 
 */
async function showcaseHandler(mpSdk)
{
    mainToggle.style.visibility = 'visible';
    mainOverlay.style.visibility = 'visible';
    console.log("Connected to Matterport SDK");
    var model = await mpSdk.Model.getData();
    console.log("Connected to " + model.sid);

    // This populates the title-gui elements
    var mdlDetails = await mpSdk.Model.getDetails();
    modelInfo.textContent = mdlDetails.name;
    details.textContent = mdlDetails.formattedAddress;

    //need to add minimap image here
    // Ive tried changing mode to floorplan then using renderer to take a screenshot
    // this gives me an image but its a bit distorted also if its not loaded properly it screenshot is distorted
    

    //Displays current position of user on minimap
//    mpSdk.on(mpSdk.Sweep.Event.ENTER, switchedSweep);


    // MiniMap functionality begins here
    var mattertags = await mpSdk.Mattertag.getData();
    // This is the entry point for mattertag search functionality
    var data = parseMattertags(mattertags);

    data.forEach(appendToUList)

    /**
     * Author: Carlos Meza
     * Description: Gathers mattertags label/ description and mattertag id
     * Input: Array of mattertags
     * Output: 2d array [[label/descrip, sid]]
     */
    function parseMattertags(mattertags)
    {
        var tags = [];
        for(i =0; i < mattertags.length; i++)
        {
            var str = mattertags[i].label + ' ' + mattertags[i].description;
            tags.push([str, mattertags[i].sid]);

        }
        tags.sort();
        return tags;
    }

    /**
     * Author: Carlos Meza
     * Description: Appends each mattertag to unordered list within index.html
     * Input: A single element from 2d array of mattertags
     * Output: Refer to description
     */
    function appendToUList(data)
    {
        var li = document.createElement('li');
        li.setAttribute('class', 'tag')
        li.textContent = data[0];
        li.setAttribute('id',data[1])
        list.appendChild(li);
    }

    /**
     * Author: Carlos Meza
     * Description: Moves the user to matter tag based on click
     * Input: List item is clicked
     * Output: User then gets moved to appropriate tag
     */
    list.addEventListener('click', (e)=> {
        mpSdk.Mattertag.navigateToTag(e.target.id,  mpSdk.Mattertag.Transition.FADEOUT);
        mapOverlay.style.visibility ='hidden';
    })

    //search input functionality activates on pressing Enter
    searchBar.addEventListener('keyup', (e) => {
        if(e.keyCode==13)
        {
            e.preventDefault();
            search();
        }
    })

    //search input functionality via typing within searchbar
    searchBar.addEventListener('input', search);

    //search input functionality via search button
    // this maybe removed and replaced with resetting feature
    //searchBtn.addEventListener('click', search)

    reset.addEventListener('click', () => {
        searchBar.value = '';
        search();
    })


    /**
     * Author: Carlos Meza
     * Description: Searches 2d array of mattertags and returns 
     *              most relavent tags based on user input
     */
    function search() {
        var input, filter, ul, li, i, txtValue;
        input = searchBar;
        filter = input.value.toLowerCase();
        ul = list;
        li = ul.getElementsByTagName('li');

        for(i =0; i < li.length; i++)
        {
            txtValue = li[i].textContent || li[i].innerText;
            if(txtValue.toLowerCase().indexOf(filter) > -1)
            {
                li[i].style.display = '';
            }
            else
            {
                li[i].style.display ='none';
            }
        }
    }

    /**
     * Author: Carlos Meza
     * Description: Allows the toggling of mattertag search functionality
     * 
     */
    tagToggle.addEventListener('click', ()=> {
        if(tagsOverlay.style.visibility == 'hidden')
        {
            tagsOverlay.style.visibility = 'visible';
            //mapOverlay.style.visibility ='hidden';
            detailsOverlay.style.visibility = 'hidden';
        }
        else if(tagsOverlay.style.visibility == 'visible')
        {
            tagsOverlay.style.visibility ='hidden';
        }
        
    });

    /**
     * Author: Carlos Meza
     * Description: Allows the toggling of details functionality
     * 
     */
    detailsToggle.addEventListener('click', () => {
        if(detailsOverlay.style.visibility == 'hidden')
        {
            detailsOverlay.style.visibility = 'visible';
            tagsOverlay.style.visibility ='hidden';
            //mapOverlay.style.visibility ='hidden';
        }
        else if(detailsOverlay.style.visibility == 'visible')
        {
            detailsOverlay.style.visibility = 'hidden';
        }
    });



}