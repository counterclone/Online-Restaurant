package com.ofos.services;

import com.ofos.models.Profile;
import com.ofos.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile profile = new Profile();
                    profile.setUserId(userId);
                    return profileRepository.save(profile);
                });
    }
    
    public Profile updateProfile(Long userId, Profile profileDetails) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });
        
        if (profileDetails.getFirstName() != null) {
            profile.setFirstName(profileDetails.getFirstName());
        }
        if (profileDetails.getLastName() != null) {
            profile.setLastName(profileDetails.getLastName());
        }
        if (profileDetails.getEmail() != null) {
            profile.setEmail(profileDetails.getEmail());
        }
        if (profileDetails.getPhoneNumber() != null) {
            profile.setPhoneNumber(profileDetails.getPhoneNumber());
        }
        if (profileDetails.getBio() != null) {
            profile.setBio(profileDetails.getBio());
        }
        
        return profileRepository.save(profile);
    }
}

