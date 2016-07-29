/*!
 * Copyright (c) 2016 2sh <contact@2sh.me>
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
$i = InputWrapper = (function()
{
	var mapping = {};
	
	function Input(element)
	{
		this.element = element;
	}
	mapping["INPUT"] = Input;
	
	Input.prototype.get = function()
	{
		var element = this.element;
		if(element.type)
		{
			var type = element.type.toLowerCase();
			if(type == "checkbox" || type == "radio")
			{
				if(element.getAttribute("value") !== null)
				{
					var value = element.checked ? element.value : null;
					var defaultValue = element.defaultChecked ? element.defaultValue : null;
				}
				else
				{
					var value = element.checked;
					var defaultValue = element.defaultChecked;
				}
				console.log(value, defaultValue, element.checked!==element.defaultChecked);
				return [value, defaultValue, element.checked!==element.defaultChecked];
			}
			else if(type == "number" || type == "range")
			{
				return [+element.value, +element.defaultValue, element.value!==element.defaultValue];
			}
		}
		return [element.value, element.defaultValue, element.value!==element.defaultValue];
	};

	Input.prototype.set = function(newValue)
	{
		var element = this.element;
		if(typeof(newValue) === "string")
		{
			element.value = element.defaultValue = newValue;
		}
		else if(typeof(newValue) === "boolean" ||
			typeof(newValue) === "number")
		{
			element.checked = element.defaultChecked = newValue;
		}
		else
		{
			element.value = element.defaultValue = newValue[0];
			element.checked = element.defaultChecked = newValue[1];
		}
	};
	
	Input.prototype.reset = function()
	{
		var element = this.element;
		element.checked = element.defaultChecked;
		element.value = element.defaultValue;
	}
	
	Input.prototype.makeDefault = function()
	{
		var element = this.element;
		element.defaultChecked = element.checked;
		element.defaultValue = element.value;
	}
	
	
	function TextArea(element)
	{
		this.element = element;
	}
	mapping["TEXTAREA"] = TextArea;

	TextArea.prototype.get = function()
	{
		var element = this.element;
		return [element.value, element.defaultValue, element.value!==element.defaultValue];
	};

	TextArea.prototype.set = function(newValue)
	{
		var element = this.element;
		element.value = element.defaultValue = newValue;
	};
	
	TextArea.prototype.reset = function()
	{
		var element = this.element;
		element.value = element.defaultValue;
	}
	
	TextArea.prototype.makeDefault = function()
	{
		var element = this.element;
		element.defaultValue = element.value;
	}
	
	
	function Select(element)
	{
		this.element = element;
	}
	mapping["SELECT"] = Select;

	Select.prototype.get = function()
	{
		var element = this.element;
		var options = element.options;
		if(element.multiple)
		{
			var values = [];
			var defaultValues = [];
			var isChanged = false;
			for(var i=0; i<options.length; i++)
			{
				if(options[i].selected)
					values.push(options[i].value);
				if(options[i].defaultSelected)
					defaultValues.push(options[i].value);
				if(options[i].selected !== options[i].defaultSelected)
					isChanged = true;
			}
			return [values, defaultValues, isChanged];
		}
		else
		{
			var value;
			if(element.selectedIndex != -1)
				value = options[element.selectedIndex].value;
			else
				value = null;
			
			for(var i=0; i<options.length; i++)
			{
				if(options[i].defaultSelected)
					return [value, options[i].value, value!==options[i].value];
			}
			return [value, null, value!==null];
		}
	};

	Select.prototype.set = function(newValue)
	{
		var element = this.element;
		var options = element.options;
		if(element.multiple)
		{
			for(var i=0; i<options.length; i++)
			{
				options[i].selected = options[i].defaultSelected = false;
				for(var vi=0; vi<newValue.length; i++)
				{
					if(options[i].value == newValue[vi])
					{
						options[i].selected = options[i].defaultSelected = true;
						break;
					}
				}
			}
		}
		else
		{
			for(var i=0; i<options.length; i++)
			{
				options[i].selected = options[i].defaultSelected =
					(options[i].value == newValue);
			}
		}
	}
	
	Select.prototype.reset = function()
	{
		var options = this.element.options;
		for(var i=0; i<options.length; i++)
		{
			options[i].selected = options[i].defaultSelected;
		}
	}
	
	Select.prototype.makeDefault = function()
	{
		var options = this.element.options;
		for(var i=0; i<options.length; i++)
		{
			options[i].defaultSelected = options[i].selected;
		}
	}
	
	
	function Option(element)
	{
		this.element = element;
	}
	mapping["OPTION"] = Option;

	Option.prototype.get = function()
	{
		var element = this.element;
		return [element.value, element.defaultValue, element.value!==element.defaultValue];
	}

	Option.prototype.set = function(newValue)
	{
		var element = this.element;
		if(typeof(newValue) === "string")
		{
			element.value = element.defaultValue = newValue;
		}
		else if(typeof(newValue) === "boolean" ||
			typeof(newValue) === "number")
		{
			element.selected = element.defaultSelected = newValue;
		}
		else
		{
			element.value = element.defaultValue = newValue[0];
			element.selected = element.defaultSelected = newValue[1];
		}
	};
	
	Option.prototype.reset = function()
	{
		var element = this.element;
		element.value = element.defaultValue;
		element.selected = element.defaultSelected;
	}
	
	Option.prototype.makeDefault = function()
	{
		var element = this.element;
		element.defaultValue = element.value;
		element.defaultSelected = element.selected;
	}
	
	
	var $ = function(element)
	{
		if(mapping[element.tagName])
			return new mapping[element.tagName](element);
		return null;
	};
	
	$.serializeToObject = function(elements, changedOnly)
	{
		var output = {};
		for(var i=0; i<elements.length; i++)
		{
			var element = elements[i];
			if(element.disabled) continue;
			var $input = $(element);
			if($input === null) continue;
			var value = $input.get();
			if(changedOnly && !value[2] && element.type != "hidden") continue;
			
			var match, regex=/([^\[\].]+)|\[()\]/g;
			var level=output, index=null;
			while(match = regex.exec(element.name))
			{
				var nextIndex;
				for(var n=1; n<match.length; n++) if(match[n] !== undefined)
				{
					nextIndex = match[n];
					break;
				}
				
				var isArray;
				if(nextIndex === "")
				{
					isArray = true;
				}
				else if(!isNaN(nextIndex))
				{
					nextIndex = +nextIndex;
					isArray = true;
				}
				else
				{
					isArray = false;
				}
				
				if(index !== null)
				{
					if(level[index] === undefined)
						level[index] = (isArray ? [] : {});
					level = level[index];
				}
				else if(isArray)
				{
					break;
				}
				index = nextIndex;
			}
			if(index === null || value[0] === null) continue;
			if(index === "")
				level.push(value[0]);
			else
				level[index] = value[0];
		}
		return output;
	}
	
	return $;
})();