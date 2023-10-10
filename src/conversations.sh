#!/bin/bash

# Function to add a new conversation
add_new_conversation() {
  # List existing contact folders in $data_dir/contacts
  contact_folders=("$data_dir/contacts"/*)

  if [ ${#contact_folders[@]} -eq 0 ]; then
    echo "No contacts found. Please create a contact first."
    return 1
  fi

  # Use Gum's filter to select a contact name from the existing ones
  selected_contact=$(printf '%s\n' "${contact_folders[@]##*/}" | gum filter)

  # Check if the selected contact folder exists
  if [ ! -d "$data_dir/contacts/$selected_contact" ]; then
    echo "Contact folder does not exist."

    # Ask if the user wants to create the contact now
    create_contact_choice=$(gum choose --prompt="Create the contact now?" "Yes" "No")

    if [ "$create_contact_choice" == "Yes" ]; then
      create_new_contact
    else
      echo "Contact not created. Exiting..."
      sleep 1
      return 1
    fi
  fi


  # Initialize conversation_topic as blank
  conversation_topic=""

    # Keep asking for the conversation topic until it isn't blank
  while [ -z "$conversation_topic" ]; do
    # Ask for conversation topic
    conversation_topic=$(gum input --prompt="Enter conversation topic:")

    # Check if it's still blank and display an error message
    [ -z "$conversation_topic" ] && echo "Conversation topic cannot be blank."
  done

  # Generate a unique conversation ID (e.g., using a timestamp)
  # not used at the moment
  conversation_id=$(date +%Y%m%d%H%M%S)

  # Create a new conversation entry in conversations.json
  echo "{
    \"date\": \"$(date +%Y-%m-%d)\",
    \"contact\": \"$selected_contact\",
    \"topic\": \"$conversation_topic\"
  }" >> "$data_dir/conversations.json"
  
}
