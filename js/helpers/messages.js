class Messages {
  constructor() {
    this.AuthenticationFatalError =
      "WARNING: API backend cannot be reached. You maybe working offline, network is unavailable or server is down.";
    this.AuthRegistrationSuccess =
      "Account registration was succesfull, you will be redirected to login in a few seconds.";
    this.AuthAreYouSureToLogout = "Are you sure you want to logout?"
    this.AuthUserLogout = "Account is now being logged out...";

    this.Item_Deleted_info = "Item record was deleted."

    this.Common_RecordWasDeleted =  "Item record was deleted."
    this.Common_DeleteOnlyWithOneSelected = "You can only delete one row at a time, select only one row to delete."
    this.Common_AreYouSureToDeleteSelected = "Are you sure you want to delete the selected item?"
    this.Common_RecordAdded = "Record was added."
    this.Common_RecordUpdated = "Record was updated."

    this.DataEntry_CannotDeleteAnymore = "Record is already synchronized to server, cannot delete anymore."
    this.DataEntry_CannotEditAnymore = "Record is already synchronized to server, cannot edit anymore."
  }
}

export default Messages;