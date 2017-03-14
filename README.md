# Input Wrapper
This JavaScript library provides a wrapper to make working with user made changes to HTML form elements (INPUT, SELECT, TEXTAREA) easier, particularly when using AJAX.
The library also provides a function to serialize form elements to an object and if needed with unchanged elements filtered out.

## Working with form elements
```
var $name = $i(document.getElementById("name"));

var values = $name.get();
// output: [<current value>, <default value>, <if changed from default: true/false>]

$name.set("Fred Bloggs");
// sets the given value to its current value and also makes it its default value

$name.reset();
// resets the current value back to the default;

$name.makeDefault();
// makes the current value the default.
```

## Serializing form elements
The 2 arguments of the serialization function are the form elements and optionally whether unchanged elements should be filtered out (true) or not.
Hidden inputs are always included, disabled elements are always excluded and readonly elements are filterable like any other elements.
```
var elements = document.querySelectorAll("#users input,select,textarea");
var all = $i.serializeToObject(elements);
var changed = $i.serializeToObject(elements, true);

// Example usage:

var people = []; // people data to be sent with AJAX;
for(var i=0; i<changed.people.length; i++)
{
	// If the keys of the person's object contains more than just the hidden ID
	if(Object.keys(changed.people[i]).length > 1)
	{
		changed.people[i].id = parseInt(changed.people[i].id);
		people.push(changed.people[i]);
	}
}
```

The output object can be sorted into sub arrays and objects by the elements' names using the square brackets or dot notation:
- ```people[0].name``` or ```people[0][name]``` - Sets the 'name' value under a person's object in the 'people' array at index 0
- ```people[1].groups[]``` or ```people[1][groups][]``` - Appends a value to the 'groups' array under a person's object in the 'people' array at index 1
