import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  type LicenseType = {
    #wireman;
    #workman;
    #supervisor;
  };
  type Status = {
    #pending;
    #approved;
    #rejected;
  };
  type LicenseApplication = {
    id : Nat;
    applicant : Principal;
    fullName : Text;
    dateOfBirth : Text;
    address : Text;
    phone : Text;
    email : Text;
    nicNumber : Text;
    licenseType : LicenseType;
    submittedAt : Int;
    status : Status;
    documents : [Document];
    remarks : ?Text;
    declarationAccepted : Bool;
  };
  type Document = {
    documentType : Text;
    blobId : ExternalBlob.ExternalBlob;
  };
  type Fee = {
    licenseType : LicenseType;
    amount : Nat;
    currency : Text;
  };
  public type Statistics = {
    total : Nat;
    pending : Nat;
    approved : Nat;
    rejected : Nat;
  };
  public type UserProfile = {
    name : Text;
  };
  public type PublicApplicationStatus = {
    id : Nat;
    fullName : Text;
    licenseType : LicenseType;
    status : Status;
    submittedAt : Int;
    remarks : ?Text;
  };

  let applications = Map.empty<Nat, LicenseApplication>();
  var nextId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Admin password for separate admin login (change this to your desired password)
  stable var adminPassword : Text = "AEIA@Admin2024";

  // Allows any authenticated user to claim admin role if they provide the correct admin password.
  // This bypasses the circular dependency of needing to be admin to assign admin.
  public shared ({ caller }) func setupAdminWithPassword(password : Text) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (password != adminPassword) {
      return false;
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func findApplication(id : Nat) : LicenseApplication {
    switch (applications.get(id)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) { app };
    };
  };

  public shared ({ caller }) func submitApplication(input : LicenseApplication) : async Nat {
    if (not input.declarationAccepted) {
      Runtime.trap("declaration not accepted");
    };
    let app : LicenseApplication = {
      input with
      id = nextId;
      applicant = caller;
      submittedAt = Time.now();
      status = #pending;
      documents = input.documents;
      remarks = null;
    };
    applications.add(nextId, app);
    nextId += 1;
    app.id;
  };

  public query func getApplicationStatus(id : Nat) : async Status {
    findApplication(id).status;
  };

  // Public query: returns limited info safe for anonymous status checks
  public query func getPublicApplicationStatus(id : Nat) : async PublicApplicationStatus {
    let app = findApplication(id);
    {
      id = app.id;
      fullName = app.fullName;
      licenseType = app.licenseType;
      status = app.status;
      submittedAt = app.submittedAt;
      remarks = app.remarks;
    };
  };

  public query ({ caller }) func getFullApplication(id : Nat) : async LicenseApplication {
    let app = findApplication(id);
    if (caller != app.applicant and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins or the original applicant can access this application");
    };
    app;
  };

  public shared ({ caller }) func updateApplicationStatus(id : Nat, status : Status, remarks : ?Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (status == #pending) {
      Runtime.trap("Cannot update to pending");
    };
    let app = findApplication(id);
    applications.add(id, { app with status; remarks });
  };

  public query ({ caller }) func getAllApplications() : async [LicenseApplication] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    applications.values().toArray();
  };

  public query ({ caller }) func getDocument(id : Nat, documentType : Text) : async ExternalBlob.ExternalBlob {
    let app = findApplication(id);
    if (caller != app.applicant and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins or the original applicant can access documents");
    };
    switch (app.documents.find(func(doc) { doc.documentType == documentType })) {
      case (null) { Runtime.trap("Document not found") };
      case (?doc) { doc.blobId };
    };
  };

  public query func getFees() : async [Fee] {
    [
      {
        licenseType = #wireman;
        amount = 100;
        currency = "INR";
      },
      {
        licenseType = #workman;
        amount = 100;
        currency = "INR";
      },
      {
        licenseType = #supervisor;
        amount = 100;
        currency = "INR";
      },
    ];
  };

  public query ({ caller }) func getStatistics() : async [(LicenseType, Statistics)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    func stats(licenseType : LicenseType) : Statistics {
      let all = applications.values().toArray();
      let filtered = all.filter(func(app) { app.licenseType == licenseType });
      let typeApps = filtered;
      let pending = filtered.filter(func(app) { app.status == #pending });
      let approved = filtered.filter(func(app) { app.status == #approved });
      let rejected = filtered.filter(func(app) { app.status == #rejected });
      {
        total = typeApps.size();
        pending = pending.size();
        approved = approved.size();
        rejected = rejected.size();
      };
    };
    [#wireman, #workman, #supervisor].map(func(lt) { (lt, stats(lt)) });
  };
};
