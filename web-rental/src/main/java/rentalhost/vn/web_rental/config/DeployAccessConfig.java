package rentalhost.vn.web_rental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.deploy")
@Getter @Setter
public class DeployAccessConfig {

    private List<String> allowedEmailDomains = new ArrayList<>();

    private List<String> allowedEmails = new ArrayList<>();
}
