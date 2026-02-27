import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Timer "mo:core/Timer";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  // Types
  type PatientId = Nat;
  type DoctorId = Nat;
  type TreatmentId = Nat;
  type MedicineId = Nat;
  type FacilityId = Nat;
  type LogId = Nat;

  // Patient
  type PatientStatus = {
    #admitted;
    #discharged;
  };

  type Day = {
    #mon;
    #tue;
    #wed;
    #thu;
    #fri;
    #sat;
    #sun;
  };

  type Patient = {
    patientId : PatientId;
    name : Text;
    admitDate : Text;
    admitDay : Day;
    admitTime : Text;
    ward : Text;
    status : PatientStatus;
    qrToken : Text;
  };

  // Doctor
  type Doctor = {
    doctorId : DoctorId;
    name : Text;
    specialty : Text;
    department : Text;
    contact : Text;
  };

  // Treatment
  type Treatment = {
    treatmentId : TreatmentId;
    patientId : PatientId;
    treatmentType : Text;
    notes : Text;
    treatmentDate : Text;
  };

  // Medicine
  type Medicine = {
    medicineId : MedicineId;
    name : Text;
    quantity : Nat;
    unit : Text;
    usage : Text;
  };

  // Facility
  type FacilityStatus = {
    #available;
    #occupied;
    #maintenance;
  };

  type Facility = {
    facilityId : FacilityId;
    name : Text;
    location : Text;
    status : FacilityStatus;
  };

  // Visitor Log
  type VisitorLog = {
    logId : LogId;
    qrToken : Text;
    patientName : Text;
    timestamp : Time.Time;
  };

  // Dashboard Stats
  type DashboardStats = {
    totalPatients : Nat;
    totalDoctors : Nat;
    totalTreatments : Nat;
    totalMedicines : Nat;
    totalFacilities : Nat;
    totalScans : Nat;
  };

  module Patient {
    public func compare(patient1 : Patient, patient2 : Patient) : Order.Order {
      Nat.compare(patient1.patientId, patient2.patientId);
    };

    public func compareByName(patient1 : Patient, patient2 : Patient) : Order.Order {
      Text.compare(patient1.name, patient2.name);
    };
  };

  // State
  stable var nextPatientIdCounter : PatientId = 1;
  stable var nextDoctorIdCounter : DoctorId = 1;
  stable var nextTreatmentIdCounter : TreatmentId = 1;
  stable var nextMedicineIdCounter : MedicineId = 1;
  stable var nextFacilityIdCounter : FacilityId = 1;
  stable var nextLogIdCounter : LogId = 1;
  stable var lastBackupTimestamp : Time.Time = 0;

  let patients = Map.empty<PatientId, Patient>();
  let doctors = Map.empty<DoctorId, Doctor>();
  let treatments = Map.empty<TreatmentId, Treatment>();
  let medicines = Map.empty<MedicineId, Medicine>();
  let facilities = Map.empty<FacilityId, Facility>();
  let visitorLogs = Map.empty<LogId, VisitorLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let qrTokenToPatient = Map.empty<Text, PatientId>();

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Private helper functions
  func generateQrToken(patientId : Nat) : Text {
    "QR-" # patientId.toText() # "-" # Time.now().toText();
  };

  // PATIENT MANAGEMENT (Admin-only write access)

  public shared ({ caller }) func createPatient(name : Text, admitDate : Text, admitDay : Day, admitTime : Text, ward : Text) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create patients");
    };

    let patientId = nextPatientIdCounter;
    nextPatientIdCounter += 1;
    
    let qrToken = generateQrToken(patientId);
    let patient : Patient = {
      patientId;
      name;
      admitDate;
      admitDay;
      admitTime;
      ward;
      status = #admitted;
      qrToken;
    };

    patients.add(patientId, patient);
    qrTokenToPatient.add(qrToken, patientId);
    patient;
  };

  public shared ({ caller }) func updatePatient(patientId : PatientId, name : ?Text, admitDate : ?Text, admitDay : ?Day, admitTime : ?Text, ward : ?Text, status : ?PatientStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update patients");
    };

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        let updatedPatient = {
          patient with
          name = switch (name) { case (null) { patient.name }; case (?n) { n } };
          admitDate = switch (admitDate) { case (null) { patient.admitDate }; case (?d) { d } };
          admitDay = switch (admitDay) { case (null) { patient.admitDay }; case (?d) { d } };
          admitTime = switch (admitTime) { case (null) { patient.admitTime }; case (?t) { t } };
          ward = switch (ward) { case (null) { patient.ward }; case (?w) { w } };
          status = switch (status) { case (null) { patient.status }; case (?s) { s } };
        };
        patients.add(patientId, updatedPatient);
      };
    };
  };

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all patients");
    };
    patients.values().toArray();
  };

  public query ({ caller }) func getAllPatientsByName() : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all patients");
    };
    patients.values().toArray().sort(Patient.compareByName);
  };

  public shared ({ caller }) func deletePatient(patientId : PatientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete patients");
    };

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        qrTokenToPatient.remove(patient.qrToken);
        patients.remove(patientId);
      };
    };
  };

  // PUBLIC ENDPOINT: Get patient by QR token (no auth required, logs access)
  public shared func getPatientByQrToken(qrToken : Text) : async ?Patient {
    switch (qrTokenToPatient.get(qrToken)) {
      case (null) { null };
      case (?patientId) {
        switch (patients.get(patientId)) {
          case (null) { null };
          case (?patient) {
            // Automatically log the access
            let logId = nextLogIdCounter;
            nextLogIdCounter += 1;
            let log : VisitorLog = {
              logId;
              qrToken;
              patientName = patient.name;
              timestamp = Time.now();
            };
            visitorLogs.add(logId, log);
            ?patient;
          };
        };
      };
    };
  };

  // DOCTOR MANAGEMENT (Admin-only write access)

  public shared ({ caller }) func createDoctor(name : Text, specialty : Text, department : Text, contact : Text) : async Doctor {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create doctors");
    };

    let doctorId = nextDoctorIdCounter;
    nextDoctorIdCounter += 1;
    
    let doctor : Doctor = {
      doctorId;
      name;
      specialty;
      department;
      contact;
    };

    doctors.add(doctorId, doctor);
    doctor;
  };

  public shared ({ caller }) func updateDoctor(doctorId : DoctorId, name : ?Text, specialty : ?Text, department : ?Text, contact : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update doctors");
    };

    switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor not found") };
      case (?doctor) {
        let updatedDoctor = {
          doctor with
          name = switch (name) { case (null) { doctor.name }; case (?n) { n } };
          specialty = switch (specialty) { case (null) { doctor.specialty }; case (?s) { s } };
          department = switch (department) { case (null) { doctor.department }; case (?d) { d } };
          contact = switch (contact) { case (null) { doctor.contact }; case (?c) { c } };
        };
        doctors.add(doctorId, updatedDoctor);
      };
    };
  };

  public query ({ caller }) func getAllDoctors() : async [Doctor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all doctors");
    };
    doctors.values().toArray();
  };

  public shared ({ caller }) func deleteDoctor(doctorId : DoctorId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete doctors");
    };

    if (not doctors.containsKey(doctorId)) {
      Runtime.trap("Doctor not found");
    };
    doctors.remove(doctorId);
  };

  // TREATMENT MANAGEMENT (Admin-only write access)

  public shared ({ caller }) func createTreatment(patientId : PatientId, treatmentType : Text, notes : Text, treatmentDate : Text) : async Treatment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create treatments");
    };

    let treatmentId = nextTreatmentIdCounter;
    nextTreatmentIdCounter += 1;
    
    let treatment : Treatment = {
      treatmentId;
      patientId;
      treatmentType;
      notes;
      treatmentDate;
    };

    treatments.add(treatmentId, treatment);
    treatment;
  };

  public shared ({ caller }) func updateTreatment(treatmentId : TreatmentId, treatmentType : ?Text, notes : ?Text, treatmentDate : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update treatments");
    };

    switch (treatments.get(treatmentId)) {
      case (null) { Runtime.trap("Treatment not found") };
      case (?treatment) {
        let updatedTreatment = {
          treatment with
          treatmentType = switch (treatmentType) { case (null) { treatment.treatmentType }; case (?t) { t } };
          notes = switch (notes) { case (null) { treatment.notes }; case (?n) { n } };
          treatmentDate = switch (treatmentDate) { case (null) { treatment.treatmentDate }; case (?d) { d } };
        };
        treatments.add(treatmentId, updatedTreatment);
      };
    };
  };

  public query ({ caller }) func getAllTreatments() : async [Treatment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all treatments");
    };
    treatments.values().toArray();
  };

  public shared ({ caller }) func deleteTreatment(treatmentId : TreatmentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete treatments");
    };

    if (not treatments.containsKey(treatmentId)) {
      Runtime.trap("Treatment not found");
    };
    treatments.remove(treatmentId);
  };

  // MEDICINE MANAGEMENT (Admin-only write access)

  public shared ({ caller }) func createMedicine(name : Text, quantity : Nat, unit : Text, usage : Text) : async Medicine {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create medicines");
    };

    let medicineId = nextMedicineIdCounter;
    nextMedicineIdCounter += 1;
    
    let medicine : Medicine = {
      medicineId;
      name;
      quantity;
      unit;
      usage;
    };

    medicines.add(medicineId, medicine);
    medicine;
  };

  public shared ({ caller }) func updateMedicine(medicineId : MedicineId, name : ?Text, quantity : ?Nat, unit : ?Text, usage : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update medicines");
    };

    switch (medicines.get(medicineId)) {
      case (null) { Runtime.trap("Medicine not found") };
      case (?medicine) {
        let updatedMedicine = {
          medicine with
          name = switch (name) { case (null) { medicine.name }; case (?n) { n } };
          quantity = switch (quantity) { case (null) { medicine.quantity }; case (?q) { q } };
          unit = switch (unit) { case (null) { medicine.unit }; case (?u) { u } };
          usage = switch (usage) { case (null) { medicine.usage }; case (?u) { u } };
        };
        medicines.add(medicineId, updatedMedicine);
      };
    };
  };

  public query ({ caller }) func getAllMedicines() : async [Medicine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all medicines");
    };
    medicines.values().toArray();
  };

  public shared ({ caller }) func deleteMedicine(medicineId : MedicineId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete medicines");
    };

    if (not medicines.containsKey(medicineId)) {
      Runtime.trap("Medicine not found");
    };
    medicines.remove(medicineId);
  };

  // FACILITY MANAGEMENT (Admin-only write access)

  public shared ({ caller }) func createFacility(name : Text, location : Text, status : FacilityStatus) : async Facility {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create facilities");
    };

    let facilityId = nextFacilityIdCounter;
    nextFacilityIdCounter += 1;
    
    let facility : Facility = {
      facilityId;
      name;
      location;
      status;
    };

    facilities.add(facilityId, facility);
    facility;
  };

  public shared ({ caller }) func updateFacility(facilityId : FacilityId, name : ?Text, location : ?Text, status : ?FacilityStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update facilities");
    };

    switch (facilities.get(facilityId)) {
      case (null) { Runtime.trap("Facility not found") };
      case (?facility) {
        let updatedFacility = {
          facility with
          name = switch (name) { case (null) { facility.name }; case (?n) { n } };
          location = switch (location) { case (null) { facility.location }; case (?l) { l } };
          status = switch (status) { case (null) { facility.status }; case (?s) { s } };
        };
        facilities.add(facilityId, updatedFacility);
      };
    };
  };

  public query ({ caller }) func getAllFacilities() : async [Facility] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all facilities");
    };
    facilities.values().toArray();
  };

  public shared ({ caller }) func deleteFacility(facilityId : FacilityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete facilities");
    };

    if (not facilities.containsKey(facilityId)) {
      Runtime.trap("Facility not found");
    };
    facilities.remove(facilityId);
  };

  // VISITOR ACCESS LOG (Admin-only read access)

  public query ({ caller }) func getVisitorLog() : async [VisitorLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view visitor logs");
    };
    visitorLogs.values().toArray();
  };

  public query func getTotalScans() : async Nat {
    visitorLogs.size().toNat();
  };

  // DAILY BACKUP (Admin-only for trigger)

  public shared ({ caller }) func triggerBackup() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can trigger backup");
    };
    lastBackupTimestamp := Time.now();
  };

  public query func getLastBackupTimestamp() : async Time.Time {
    lastBackupTimestamp;
  };

  // DASHBOARD STATS (Public read access)

  public query func getDashboardStats() : async DashboardStats {
    {
      totalPatients = patients.size().toNat();
      totalDoctors = doctors.size().toNat();
      totalTreatments = treatments.size().toNat();
      totalMedicines = medicines.size().toNat();
      totalFacilities = facilities.size().toNat();
      totalScans = visitorLogs.size().toNat();
    };
  };
};
