var list;
var overlay;
var searchLabel;
var searchBtn;
var showcaseFrame;
var displayToggle;

// This sets the global vars above and sets up connection
// to matterport once the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    showcaseFrame = document.getElementById('showcase_iframe');
    searchLabel = document.getElementById('search-bar');
    searchBtn = document.getElementById('search-btn')
    list = document.getElementById('mt-container');
    overlay = document.getElementById('overlay-container');
    displayToggle = document.getElementById('overlay-toggle');
    overlay.style.visibility = 'hidden';
    showcaseFrame.addEventListener('load', showcaseLoader, true);

})

/**
 * Author: Carlos Meza
 * Date: 08/14/2020
 * Description: This function sets initiatest the connection to the matterport SDK
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
   
    displayToggle.addEventListener('click', ()=> {
        if(overlay.style.visibility == 'hidden')
        {
            overlay.style.visibility = 'visible';
        }
        else if(overlay.style.visibility == 'visible')
        {
            overlay.style.visibility ='hidden';
        }
        
    })

    console.log("Connected to Matterport SDK");
    var model = await mpSdk.Model.getData();
    console.log("Connected to " + model.sid);

    var mattertags = await mpSdk.Mattertag.getData();

   

    var data = parseMattertags(mattertags);

    data.forEach(appendToUList)
    overlay.style.visibility = 'visible';

    // mattertag functionality
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

    // mattertag functionality 
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
        mpSdk.Mattertag.navigateToTag(e.target.id);
    })

    //search input functionality
    searchLabel.addEventListener('keyup', (e) => {
        if(e.keyCode==13)
        {
            e.preventDefault();
            search();
        }
    })

    //search input functionality
    searchLabel.addEventListener('input', search);

    //search input functionality
    searchBtn.addEventListener('click', search)

    function search() {
        var input, filter, ul, li, i, txtValue;
        input = searchLabel;
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

}