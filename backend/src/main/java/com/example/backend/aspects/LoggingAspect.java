package com.example.backend.aspects;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("execution(* com.example.backend.services.*.*(..))")
    public void serviceMethods() {}

    @Around("serviceMethods()")
    public Object logServiceCall(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[SERVICE] → {}", method);
        try {
            Object result = pjp.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("[SERVICE] ← {} completed in {}ms", method, elapsed);
            return result;
        } catch (Throwable ex) {
            log.warn("[SERVICE] ✗ {} threw {}: {}", method, ex.getClass().getSimpleName(), ex.getMessage());
            throw ex;
        }
    }

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void logServiceException(Exception ex) {
        log.error("[SERVICE EXCEPTION] {}: {}", ex.getClass().getName(), ex.getMessage());
    }
}
