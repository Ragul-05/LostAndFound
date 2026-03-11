package com.example.backend.aspects;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceAspect {

    private static final Logger log = LoggerFactory.getLogger(PerformanceAspect.class);
    private static final long SLOW_THRESHOLD_MS = 500;

    @Pointcut("execution(* com.example.backend.controllers.*.*(..))")
    public void controllerMethods() {}

    @Around("controllerMethods()")
    public Object monitorPerformance(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;
        if (elapsed > SLOW_THRESHOLD_MS) {
            log.warn("[PERFORMANCE] Slow request detected: {} took {}ms (threshold: {}ms)",
                    method, elapsed, SLOW_THRESHOLD_MS);
        } else {
            log.debug("[PERFORMANCE] {} completed in {}ms", method, elapsed);
        }
        return result;
    }
}
