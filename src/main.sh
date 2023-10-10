#!/bin/bash
# Entry point for the PRM tool
# Get the directory of the script
script_dir=$(dirname "$0")

# Define the data directory relative to the script
data_dir="$script_dir/../data"

# Define the options and associated functions in the _options variable
_options=()

# source other files
source $script_dir/contacts.sh
source $script_dir/conversations.sh
source $script_dir/events.sh


check_deps() {
  # Check dependencies from deps.txt
  while IFS=" @ > " read -r command repo description; do
    if ! command -v $command &> /dev/null; then
      echo "$command is not installed. Please install it from $repo and run the tool again."
      exit 1
    fi
  done < ./deps.txt
  
  # Check if .meta.json exists, if not create it
  if [ ! -f "./.meta.json" ]; then
    echo '{
    "last_run": "",
    "last_contact_id": 0
  }' > "$script_dir/.meta.json"
  fi
  
}

update_last_seen() {
  # Update last_run in .meta.json
  new_meta=$(jq --arg date "$(date +%Y-%m-%d\ %H:%M:%S)" '.last_run = $date' ./.meta.json)
  if [ $? -eq 0 ]; then
    echo "$new_meta" > $script_dir/.meta.json
  else
    echo "Failed to update .meta.json"
  fi
  
}

# ===================

main() {
  
  _options+=("Exit:exit_app")
  
  while true; do
    # Clear the screen
    clear

    # Define the options
    options=()
    for option in "${_options[@]}"; do
      option_name="${option%%:*}"
      options+=("$option_name")
    done

    
    # Display options and capture user selection
    user_choice=$(printf '%s\n' "${options[@]}" | gum filter)

    # Perform actions based on user selection
    for option in "${_options[@]}"; do
      option_name="${option%%:*}"
      option_function="${option##*:}"
      if [ "$user_choice" == "$option_name" ]; then
        $option_function
        break
      fi
    done
  done
}

exit_app() {
  # clear
  # echo "Goodbye!"
  sleep 0.5
  tput rmcup
  exit 0
}


# Switch to the secondary console
tput smcup


check_deps
update_last_seen

main
