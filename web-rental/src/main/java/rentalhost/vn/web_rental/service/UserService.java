package rentalhost.vn.web_rental.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rentalhost.vn.web_rental.dto.UserDTO;
import rentalhost.vn.web_rental.exception.ResourceNotFoundException;
import rentalhost.vn.web_rental.mapper.UserMapper;
import rentalhost.vn.web_rental.model.User;
import rentalhost.vn.web_rental.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserDTO.UserResponse getProfile(Long userId) {
        User user = findUserById(userId);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserDTO.UserResponse updateProfile(Long userId, UserDTO.UpdateProfileRequest request) {
        User user = findUserById(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
