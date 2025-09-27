// Simple test script to demonstrate where registration form data is stored
const mongoose = require('mongoose');
require('dotenv').config();

const Tournament = require('./models/Tournament');
const TournamentRegistration = require('./models/TournamentRegistration');

async function showRegistrationData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all detailed registrations in the separate collection
    const detailedRegistrations = await TournamentRegistration.find({})
      .populate('userId', 'name email')
      .populate('tournamentId', 'name type date');

    console.log('\n📋 TOURNAMENT REGISTRATIONS (SEPARATE COLLECTION):');
    console.log('==================================================');

    if (detailedRegistrations.length === 0) {
      console.log('❌ No detailed registrations found yet.');
      console.log('💡 Register for a tournament using the frontend form to see data here.');
    } else {
      detailedRegistrations.forEach((registration, index) => {
        console.log(`\n� Registration #${index + 1}:`);
        console.log(`   🆔 Registration ID: ${registration._id}`);
        console.log(`   🏆 Tournament: ${registration.tournamentId?.name} (${registration.tournamentId?.type})`);
        console.log(`   � User: ${registration.userId?.name} (${registration.userId?.email})`);
        console.log(`   📅 Registration Date: ${registration.registrationDate}`);
        console.log(`   💳 Payment Status: ${registration.paymentStatus}`);
        console.log(`   🔄 Registration Status: ${registration.status.registrationStatus}`);
        
        console.log(`\n   📝 DETAILED FORM DATA:`);
        console.log(`      👤 PERSONAL INFO:`);
        console.log(`         🏷️  Full Name: ${registration.personalInfo.fullName}`);
        console.log(`         📧 Email: ${registration.personalInfo.email}`);
        console.log(`         📞 Phone: ${registration.personalInfo.phone}`);
        console.log(`         🎂 Date of Birth: ${registration.personalInfo.dateOfBirth}`);
        console.log(`         👤 Gender: ${registration.personalInfo.gender}`);
        
        console.log(`      🏠 ADDRESS INFO:`);
        console.log(`         🏠 Address: ${registration.addressInfo.address}`);
        console.log(`         🏙️  City: ${registration.addressInfo.city}`);
        console.log(`         📍 State: ${registration.addressInfo.state}`);
        console.log(`         📮 ZIP Code: ${registration.addressInfo.zipCode}`);
        console.log(`         🌍 Country: ${registration.addressInfo.country}`);
        
        console.log(`      🚨 EMERGENCY CONTACT:`);
        console.log(`         👤 Name: ${registration.emergencyContact.name}`);
        console.log(`         📞 Phone: ${registration.emergencyContact.phone}`);
        console.log(`         💑 Relation: ${registration.emergencyContact.relation}`);
        
        console.log(`      🏅 SPORTS INFO:`);
        console.log(`         📊 Experience: ${registration.sportsInfo.experience}`);
        console.log(`         🏆 Previous Tournaments: ${registration.sportsInfo.previousTournaments || 'None'}`);
        console.log(`         💊 Medical Conditions: ${registration.sportsInfo.medicalConditions || 'None'}`);
        console.log(`         ⚠️  Special Requirements: ${registration.sportsInfo.specialRequirements || 'None'}`);
        
        console.log(`      ℹ️  ADDITIONAL INFO:`);
        console.log(`         📢 How they heard: ${registration.additionalInfo.howDidYouHear || 'Not specified'}`);
        console.log(`         💬 Comments: ${registration.additionalInfo.additionalComments || 'None'}`);
        
        console.log(`      💳 PAYMENT INFO:`);
        console.log(`         💸 Payment Method: ${registration.paymentInfo.paymentMethod}`);
        console.log(`         💰 Amount Paid: ₹${registration.paymentInfo.amountPaid || 0}`);
        
        console.log(`      ✅ AGREEMENTS:`);
        console.log(`         � Terms Accepted: ${registration.agreements.termsAndConditions}`);
        console.log(`         🔒 Privacy Policy: ${registration.agreements.privacyPolicy}`);
      });
    }

    // Also show basic tournament registrations
    const tournaments = await Tournament.find({ 'registeredUsers.0': { $exists: true } })
      .populate('registeredUsers.userId', 'name email');

    console.log('\n\n📊 TOURNAMENT BASIC REGISTRATIONS (EMBEDDED):');
    console.log('==============================================');

    tournaments.forEach(tournament => {
      console.log(`\n🏆 Tournament: ${tournament.name}`);
      console.log(`👥 Total Registered Users: ${tournament.registeredUsers.length}`);
      
      tournament.registeredUsers.forEach((registration, index) => {
        console.log(`   ${index + 1}. ${registration.userId?.name} - ${registration.paymentStatus}`);
      });
    });

    console.log('\n==================================================');
    console.log('📍 NEW DATA STORAGE LOCATIONS:');
    console.log('   1. DETAILED FORM DATA:');
    console.log('      Database: MongoDB Atlas');
    console.log('      Collection: tournamentregistrations (separate collection)');
    console.log('      Structure: Complete form data organized in categories');
    console.log('\n   2. BASIC REGISTRATION DATA:');
    console.log('      Database: MongoDB Atlas');
    console.log('      Collection: tournaments');
    console.log('      Field Path: registeredUsers[] (simplified reference)');
    console.log('\n✅ Form data is now stored in a SEPARATE collection for better organization!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
console.log('🔍 CHECKING NEW REGISTRATION DATA STORAGE STRUCTURE...\n');
showRegistrationData();