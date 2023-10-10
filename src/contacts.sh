#!/bin/bash

# Function to check if contact already exists
check_contact_exists() {
  local contact_name="$1"

  if [ -d "$data_dir/contacts/$contact_name" ]; then
    return 1
  else
    return 0
  fi
}

# Function to create a new contact
create_new_contact() {

  # Initialize first_name as blank
  first_name=""

  # Keep asking for the first name until it isn't blank
  while [ -z "$first_name" ] && [ "$escaped" = false ]; do
    # Ask for first name
    first_name=$(gum input --prompt="Enter first name:")

    # Check if it's still blank and display an error message
    [ -z "$first_name" ] && echo "First name cannot be blank."
  done
  
  # Ask for last name (optional)
  last_name=$(gum input --prompt="Enter last name (optional):")

  # Combine first and last name
  contact_name="$first_name"
  [ -n "$last_name" ] && contact_name+=" $last_name"

  # Check if contact folder already exists
  check_contact_exists "$contact_name"
  if [ $? -eq 1 ]; then
    # Define options for existing contact
    local existing_contact_options=("Re-enter Name" "Edit Existing" "Cancel")

    # Ask user what to do
    local user_choice=$(printf '%s\n' "${existing_contact_options[@]}" \
    | gum filter --prompt="Contact already exists. What would you like to do?")

    case "$user_choice" in
      "Re-enter Name")
        create_new_contact
        return
        ;;
      "Edit Existing")
        # Code to edit existing contact
        return
        ;;
      "Cancel")
        return
        ;;
    esac
  fi

  # Define relationship options
  relationship_options=("Friend" "Family" "Acquaintance" "Other")

  # Ask for relationship
  relationship=$(printf '%s\n' "${relationship_options[@]}" | gum filter --prompt="Select relationship: ")

  # If "Other", ask for custom relationship
  if [ "$relationship" == "Other" ]; then
    relationship=$(gum input --prompt="Enter custom relationship: ")
  fi

  # Confirm if you spoke to the contact today
  spoke_today=$(gum confirm "Did you speak to $contact_name today?" && echo "true" || echo "false")

  # If spoke today, ask for topic
  if [ "$spoke_today" == "true" ]; then
    conversation_topic=$(gum write --value "Talked about ")
  fi

  # Create a directory for the contact
  mkdir -p "$data_dir/contacts/$contact_name"

  # Create a markdown file for the contact
  echo "- Name: $contact_name
- Relationship: $relationship" > "$data_dir/contacts/$contact_name/contact.md"

  # Create a JSON file for the contact
  echo "{
  \"name\": \"$contact_name\",
  \"relationship\": \"$relationship\",
  \"milestones\": []
}" > "$data_dir/contacts/$contact_name/contact.json"

  # If spoke today, add a conversation entry
  if [ "$spoke_today" == "true" ]; then
    echo "{
      \"date\": \"$(date +%Y-%m-%d)\",
      \"contact\": \"$contact_name\",
      \"topic\": \"$conversation_topic\"
    }" > "$data_dir/conversations.json"
  fi
}


# Register contacts functions into global menu
# Define a list of function names
function_names=(
  "create_new_contact"
  "list_contacts"
  "add_new_conversation"
  "add_new_event"
)

# Loop through the function names and add them to _options if declared
for func_name in "${function_names[@]}"; do
  if declare -f "$func_name" &> /dev/null; then
    _options+=("$(echo "$func_name" | sed 's/_/ /g'):$func_name")
  fi
done
